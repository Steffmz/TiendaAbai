import { mount } from '@vue/test-utils';
import App from '../src/App.vue';

describe('App.vue', () => {
  it('renderiza el componente principal', () => {
    const wrapper = mount(App, { global: { stubs: ['router-view'] } });
    expect(wrapper.exists()).toBe(true);
  });
});
