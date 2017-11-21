export const windowRefStub = {
  nativeWindow: {
    confirm: (text: string) => {
      return true;
    },
    location: {
      reload: () => {
      }
    },
    open: () => {
    }
  }
};
