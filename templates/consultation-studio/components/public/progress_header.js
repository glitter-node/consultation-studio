import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'progress_header',
  area: 'public',
  selectData({ reservation }) {
    return {
      summary: reservation.summary,
      verification: reservation.verification,
      state: reservation.state
    };
  }
});
