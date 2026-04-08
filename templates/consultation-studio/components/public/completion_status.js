import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'completion_status',
  area: 'public',
  selectData({ reservation }) {
    return {
      state: reservation.state,
      verification: reservation.verification,
      complete: reservation.complete
    };
  }
});
