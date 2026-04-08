import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'completion_notice',
  area: 'public',
  selectData({ reservation }) {
    return {
      complete: reservation.complete
    };
  }
});
