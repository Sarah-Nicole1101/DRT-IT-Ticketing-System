
// Store tickets and uploaded photos locally in the employee's browser.
const DB_NAME = 'drt-employee-ticket-demo-v1';
const DB_VERSION = 4;

// Get the current year and month using Philippine time.
function getTicketPeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(now);

  const year = parts.find(part => part.type === 'year').value;
  const month = parts.find(part => part.type === 'month').value;

  return `${year}-${month}`;
}

// Generate a ticket ID using the year, month, and monthly sequence.
export function createTicketReference(number, now = new Date()) {
  const period = getTicketPeriod(now);
  const ticketNumber = String(number).padStart(3, '0');

  return `TKT-${period}-${ticketNumber}`;
}

// Preserve the old reference format for older tickets without IDs.
function createLegacyTicketReference(now, id) {
  const year = now.getFullYear();
  const randomPart = id.replaceAll('-', '').slice(0, 12).toUpperCase();

  return `DRT-IT-${year}-${randomPart}`;
}

// Open the local IndexedDB database and prepare its stores.
function openDatabase() {
  return new Promise((resolve, reject) => {
    // Check whether the browser supports IndexedDB.
    if (!('indexedDB' in window)) {
      reject(new Error('This browser does not support demonstration storage.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Could not open browser storage.'));
    };

    // Upgrade the database without deleting existing tickets.
    request.onupgradeneeded = () => {
      const db = request.result;
      const upgrade = request.transaction;

      let ticketsStore;

      // Create or reuse the ticket storage.
      if (!db.objectStoreNames.contains('tickets')) {
        ticketsStore = db.createObjectStore('tickets', {
          keyPath: 'id'
        });
      } else {
        ticketsStore = upgrade.objectStore('tickets');
      }

      // Create an index for searching tickets by department.
      if (!ticketsStore.indexNames.contains('by-department')) {
        ticketsStore.createIndex('by-department', 'departmentCode');
      }

      // Create an index for searching tickets by exact reference.
      if (!ticketsStore.indexNames.contains('by-reference')) {
        ticketsStore.createIndex('by-reference', 'reference', {
          unique: true
        });
      }

      // Store uploaded photos separately from ticket information.
      if (!db.objectStoreNames.contains('photos')) {
        const photosStore = db.createObjectStore('photos', {
          keyPath: 'id'
        });

        photosStore.createIndex('by-ticket', 'ticketId');
      }

      // Store the last issued ticket number for each month.
      if (!db.objectStoreNames.contains('counters')) {
        db.createObjectStore('counters', {
          keyPath: 'key'
        });
      }

      const countersStore = upgrade.objectStore('counters');

      // Track the highest existing ticket number for each month.
      const highestByPeriod = new Map();

      // Read existing tickets to preserve their references.
      const cursorRequest = ticketsStore.openCursor();

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;

        // Initialize monthly counters after checking all tickets.
        if (!cursor) {
          for (const [period, highestNumber] of highestByPeriod) {
            const counterKey = `ticket-reference-${period}`;

            // Preserve any higher counter already stored.
            const existingRequest = countersStore.get(counterKey);

            existingRequest.onsuccess = () => {
              const existingNumber =
                existingRequest.result?.lastNumber ?? 0;

              const lastNumber = Math.max(
                existingNumber,
                highestNumber
              );

              countersStore.put({
                key: counterKey,
                lastNumber
              });
            };
          }

          return;
        }

        const ticket = cursor.value;

        // Give legacy tickets a reference if one is missing.
        if (!ticket.reference) {
          ticket.reference = createLegacyTicketReference(
            new Date(ticket.createdAt),
            ticket.id
          );

          cursor.update(ticket);
        }

        // Find tickets already using the year-month reference format.
        const match = /^TKT-(\d{4}-(?:0[1-9]|1[0-2]))-(\d+)$/.exec(
          ticket.reference
        );

        if (match) {
          const period = match[1];
          const number = Number(match[2]);

          // Remember the highest number issued within that month.
          highestByPeriod.set(
            period,
            Math.max(highestByPeriod.get(period) ?? 0, number)
          );
        }

        cursor.continue();
      };
    };

    // Return the database when it is ready.
    request.onsuccess = () => resolve(request.result);
  });
}

// Save a new Pending ticket and its uploaded photos.
export async function saveTicket({
  fullName,
  departmentCode,
  description,
  files
}) {
  const db = await openDatabase();

  // Record the submission date and generate an internal UUID.
  const now = new Date();
  const id = crypto.randomUUID();
  const createdAt = now.toISOString();

  // Determine which monthly counter should be incremented.
  const period = getTicketPeriod(now);
  const counterKey = `ticket-reference-${period}`;

  return new Promise((resolve, reject) => {
    // Save the ticket, photos, and counter in one transaction.
    const tx = db.transaction(
      ['tickets', 'photos', 'counters'],
      'readwrite'
    );

    const ticketsStore = tx.objectStore('tickets');
    const photosStore = tx.objectStore('photos');
    const countersStore = tx.objectStore('counters');

    let ticket;

    // Get the last ticket number issued for the current month.
    const counterRequest = countersStore.get(counterKey);

    counterRequest.onsuccess = () => {
      // Start at 001 each month, then increment automatically.
      const nextNumber =
        (counterRequest.result?.lastNumber ?? 0) + 1;

      // Save the updated monthly ticket counter.
      countersStore.put({
        key: counterKey,
        lastNumber: nextNumber
      });

      // Prepare the new ticket with its formatted reference.
      ticket = {
        id,
        reference: createTicketReference(nextNumber, now),
        fullName,
        departmentCode,
        description,
        status: 'Pending',
        createdAt,
        updatedAt: createdAt,
        resolvedAt: null,
        adminNote: '',
        events: [
          {
            status: 'Pending',
            at: createdAt,
            publicNote: 'Your IT concern was received.'
          }
        ],
        photoCount: files.length
      };

      // Save the new ticket to IndexedDB.
      ticketsStore.add(ticket);

      // Save the original uploaded photos.
      for (const file of files) {
        photosStore.put({
          id: crypto.randomUUID(),
          ticketId: id,
          fileName: file.name,
          type: file.type,
          blob: file
        });
      }
    };

    // Confirm submission after all database writes succeed.
    tx.oncomplete = () => {
      db.close();
      resolve(ticket);
    };

    // Return an error if the transaction fails.
    tx.onabort = () => {
      db.close();
      reject(
        tx.error ?? new Error('Ticket storage was interrupted.')
      );
    };
  });
}

// Return all tickets submitted under a selected municipal office.
export async function listTicketsByDepartment(departmentCode) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    // Open the ticket storage in read-only mode.
    const tx = db.transaction('tickets', 'readonly');

    // Find tickets belonging to the selected department.
    const request = tx.objectStore('tickets')
      .index('by-department')
      .getAll(departmentCode);

    // Return the matching department tickets.
    request.onsuccess = () => {
      resolve(request.result ?? []);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error('Could not load department tickets.')
      );
    };

    // Close the database after reading.
    tx.oncomplete = () => db.close();

    tx.onerror = () => {
      db.close();
      reject(
        tx.error ?? new Error('Could not load department tickets.')
      );
    };
  });
}

// Find a specific ticket using its exact public Ticket ID.
export async function getTicketByReference(reference) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    // Open the ticket storage in read-only mode.
    const tx = db.transaction('tickets', 'readonly');

    // Search using the normalized ticket reference.
    const request = tx.objectStore('tickets')
      .index('by-reference')
      .get(reference.trim().toUpperCase());

    // Return the matching ticket or null if none exists.
    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error('Could not find ticket.')
      );
    };

    // Close the database when the search finishes.
    tx.oncomplete = () => db.close();

    tx.onerror = () => {
      db.close();
      reject(
        tx.error ?? new Error('Could not find ticket.')
      );
    };
  });
}
