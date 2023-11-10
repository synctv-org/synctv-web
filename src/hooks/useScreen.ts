import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";

const { width, height } = useWindowSize();

export const useScreen = () => {
  const isPhone = computed(() => width.value < 768);

  return {
    isPhone
  };
};
