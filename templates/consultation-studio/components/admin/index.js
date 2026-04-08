import { createBlockRegistry } from '../../assets/js/block-registry.js';
import pageHeader from './page_header.js';
import reservationFilterBar from './reservation_filter_bar.js';
import reservationTable from './reservation_table.js';
import reservationDetailCard from './reservation_detail_card.js';
import verificationStatusBox from './verification_status_box.js';
import reservationMemoPanel from './reservation_memo_panel.js';
import actionBar from './action_bar.js';

const blocks = [
  pageHeader,
  reservationFilterBar,
  reservationTable,
  reservationDetailCard,
  verificationStatusBox,
  reservationMemoPanel,
  actionBar
];

export const adminBlockRegistry = createBlockRegistry(blocks);
export const adminBlocks = adminBlockRegistry.ids;

export function registerAdminBlocks() {
  return adminBlockRegistry;
}

export function resolveAdminBlock(id) {
  return adminBlockRegistry.resolve(id);
}
