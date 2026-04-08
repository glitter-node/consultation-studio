import { createBindingContext } from './data-binding.js';

export function createBlockComponent(config) {
  return {
    id: config.id,
    area: config.area,
    resolve(context = {}) {
      const bindings = createBindingContext(context);
      const data = typeof config.selectData === 'function' ? config.selectData(bindings, context) : {};
      return {
        id: config.id,
        area: config.area,
        data: data ?? {}
      };
    },
    render(context = {}) {
      return this.resolve(context);
    }
  };
}

export function createBlockRegistry(blocks) {
  const entries = Object.fromEntries(blocks.map((block) => [block.id, block]));
  return {
    blocks: entries,
    ids: Object.keys(entries),
    resolve(id) {
      return entries[id] ?? createFallbackBlock(id);
    }
  };
}

export function createFallbackBlock(id) {
  return createBlockComponent({
    id,
    area: 'shared',
    selectData() {
      return {};
    }
  });
}
