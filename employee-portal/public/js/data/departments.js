/** Canonical department IDs. Keep stable when connecting the MySQL API. */
export const OFFICE_GROUPS = Object.freeze([
  {
    category: 'Executive',
    offices: [
      ['MO', 'Office of the Municipal Mayor'],
      ['MADO', 'Municipal Administrator’s Office'],
      ['MIO', 'Municipal Information Office'],
      ['MASSO', 'Municipal Assessor’s Office'],
      ['MCRO', 'Municipal Civil Registrar’s Office'],
      ['PESO', 'Public Employment Service Office'],
      ['LYDO', 'Local Youth Development Office'],
      ['MDRRMO', 'Municipal Disaster Risk Reduction & Management Office'],
      ['DRTWS', 'DRT Water System Office'],
      ['BPLO', 'Business Permit & Licensing Office'],
      ['MTCAO', 'Municipal Tourism & Culture & Arts Office'],
      ['HRMO', 'Human Resource Management Office'],
      ['GSO', 'General Service Office'],
    ],
  },
  {
    category: 'Legislative',
    offices: [
      ['VMO', 'Office of the Vice Mayor'],
      ['SBO', 'Office of the Sangguniang Bayan'],
    ],
  },
  {
    category: 'Finance',
    offices: [
      ['MPDO', 'Municipal Planning & Development Office'],
      ['MBO', 'Municipal Budget Office'],
      ['MACCO', 'Municipal Accounting Office'],
      ['MTO', 'Municipal Treasurer’s Office'],
    ],
  },
  {
    category: 'Social Services',
    offices: [
      ['MHO', 'Municipal Health Office'],
      ['MSWDO', 'Municipal Social Welfare & Development Office'],
      ['MDO', 'Municipal Dental Office'],
    ],
  },
  {
    category: 'Economic Development',
    offices: [
      ['MAO', 'Municipal Agriculture Office'],
      ['MENRO', 'Municipal Environment & Natural Resources Office'],
      ['MEO', 'Municipal Engineering Office'],
    ],
  },
]);

export const DEPARTMENTS = Object.freeze(
  OFFICE_GROUPS.flatMap(({ category, offices }) =>
    offices.map(([code, name]) => Object.freeze({ code, name, category })),
  ),
);

export const DEPARTMENT_BY_CODE = new Map(DEPARTMENTS.map(office => [office.code, office]));
export const getOffice = code => DEPARTMENT_BY_CODE.get(code) ?? null;
