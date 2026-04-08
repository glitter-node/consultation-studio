import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'verification_status_box',
  area: 'public',
  selectData({ reservation }) {
    return {
      verification: reservation.verification,
      state: reservation.state
    };
  }
});
