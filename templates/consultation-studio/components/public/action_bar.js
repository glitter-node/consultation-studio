import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'action_bar',
  area: 'public',
  selectData({ reservation }) {
    return {
      summary: reservation.summary,
      lookup: reservation.lookup,
      verification: reservation.verification,
      complete: reservation.complete,
      state: reservation.state
    };
  }
});
