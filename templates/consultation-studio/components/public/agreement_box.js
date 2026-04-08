import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'agreement_box',
  area: 'public',
  selectData({ reservation }) {
    return {
      summary: reservation.summary
    };
  }
});
