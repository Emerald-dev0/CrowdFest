/**
 * User personas (spec §5.4).
 * Behaviour profiles that define how a simulated user interacts.
 */

export interface Persona {
  id: string;
  name: string;
  behaviour: string;
  /** Distribution weight (0-100) */
  distribution: number;
  /** Journey steps associated with this persona */
  steps: string[];
}

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'new_visitor',
    name: 'New visitor',
    behaviour: 'Homepage and registration',
    distribution: 30,
    steps: ['navigate_homepage', 'navigate_registration', 'submit_registration'],
  },
  {
    id: 'returning_user',
    name: 'Returning user',
    behaviour: 'Login and dashboard',
    distribution: 30,
    steps: ['navigate_login', 'submit_login', 'view_dashboard'],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    behaviour: 'Search and browse',
    distribution: 20,
    steps: ['navigate_homepage', 'search_items', 'browse_results'],
  },
  {
    id: 'active_user',
    name: 'Active user',
    behaviour: 'Repeated application interactions',
    distribution: 15,
    steps: ['navigate_dashboard', 'submit_form', 'navigate_settings'],
  },
  {
    id: 'occasional_user',
    name: 'Occasional user',
    behaviour: 'Infrequent visits',
    distribution: 5,
    steps: ['navigate_homepage'],
  },
];
