import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'applicant_form',
  area: 'public',
  selectData({ reservation }) {
    return {
      summary: reservation.summary
    };
  }
});
