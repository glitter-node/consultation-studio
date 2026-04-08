import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'branch_selector',
  area: 'public',
  selectData({ reservation }) {
    return {
      branches: reservation.branches,
      summary: reservation.summary
    };
  }
});
