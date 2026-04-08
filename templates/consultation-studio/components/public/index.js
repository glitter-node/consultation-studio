import { createBlockRegistry } from '../../assets/js/block-registry.js';
import progressHeader from './progress_header.js';
import consultationTypeSelector from './consultation_type_selector.js';
import branchSelector from './branch_selector.js';
import datePicker from './date_picker.js';
import timeSlotGrid from './time_slot_grid.js';
import applicantForm from './applicant_form.js';
import agreementBox from './agreement_box.js';
import reservationSummary from './reservation_summary.js';
import verificationStatusBox from './verification_status_box.js';
import reservationLookupForm from './reservation_lookup_form.js';
import reservationStatusCard from './reservation_status_card.js';
import actionBar from './action_bar.js';
import completionStatus from './completion_status.js';
import completionNotice from './completion_notice.js';

const blocks = [
  progressHeader,
  consultationTypeSelector,
  branchSelector,
  datePicker,
  timeSlotGrid,
  applicantForm,
  agreementBox,
  reservationSummary,
  verificationStatusBox,
  reservationLookupForm,
  reservationStatusCard,
  actionBar,
  completionStatus,
  completionNotice
];

export const publicBlockRegistry = createBlockRegistry(blocks);
export const publicBlocks = publicBlockRegistry.ids;

export function registerPublicBlocks() {
  return publicBlockRegistry;
}

export function resolvePublicBlock(id) {
  return publicBlockRegistry.resolve(id);
}
