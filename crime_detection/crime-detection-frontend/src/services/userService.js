import api from "./api";

const userService = {
  saveOnboarding(profile) {
    return api.post("/users/onboarding", profile);
  },
};

export default userService;
