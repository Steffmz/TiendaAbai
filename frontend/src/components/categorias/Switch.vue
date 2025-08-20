<template>
  <button
    :class="rootClasses"
    role="switch"
    :aria-checked="isChecked.toString()"
    @click="toggle"
    :disabled="disabled"
  >
    <span
      class="absolute inset-0 flex items-center font-medium text-[0.8rem] tracking-wide px-2"
      :class="isChecked ? 'justify-start text-white' : 'justify-end text-white'"
    >
      {{ isChecked ? 'Activo' : 'Inactivo' }}
    </span>
    <span :class="thumbClasses" />
  </button>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'change']);

const isChecked = ref(!!props.modelValue);

watch(
  () => props.modelValue,
  (v) => (isChecked.value = !!v)
);

const toggle = () => {
  if (props.disabled) return;
  isChecked.value = !isChecked.value;
  emit('update:modelValue', isChecked.value);
  emit('change', isChecked.value);
};

const rootClasses = computed(() => {
  const base =
    'relative inline-flex items-center h-7 w-20 rounded-full border transition-all duration-300 ease-in-out outline-none cursor-pointer shadow';
  const border = 'border-transparent';
  const bg = isChecked.value
    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
    : 'bg-gradient-to-r from-rose-400 to-rose-500';
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
  return [base, border, bg, disabled].filter(Boolean).join(' ');
});

const thumbClasses = computed(() => {
  const base =
    'absolute w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out';
  const pos = isChecked.value ? 'translate-x-[3.8rem]' : 'translate-x-1';
  return [base, pos].join(' ');
});
</script>
