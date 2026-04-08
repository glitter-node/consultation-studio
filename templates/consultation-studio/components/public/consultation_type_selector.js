import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'consultation_type_selector',
  area: 'public',
  selectData({ reservation }) {
    return {
      consultationTypes: reservation.consultation_types
    };
  }
});
