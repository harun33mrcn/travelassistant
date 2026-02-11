export type Theme = "light" | "dark" | "system";

export const getTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("travelmind_theme");
  return (savedTheme as Theme) || "light";
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("travelmind_theme", theme);
  applyTheme(theme);
};

export const applyTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  } else if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const initializeTheme = (): void => {
  if (typeof window === "undefined") return;
  const theme = getTheme();
  applyTheme(theme);
};

interface Feedback {
  id: string;
  createdAt: string;
  text: string;
}

export const getFeedbackList = (): Feedback[] => {
  if (typeof window === "undefined") return [];
  const feedback = localStorage.getItem("travelmind_feedback");
  return feedback ? JSON.parse(feedback) : [];
};

export const addFeedback = (text: string): void => {
  if (typeof window === "undefined") return;
  const feedbackList = getFeedbackList();
  const newFeedback: Feedback = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    text,
  };
  feedbackList.push(newFeedback);
  localStorage.setItem("travelmind_feedback", JSON.stringify(feedbackList));
};

export interface Preferences {
  currency: "EUR" | "USD" | "TRY";
  dateFormat: "DD.MM.YYYY" | "MM/DD/YYYY";
  defaultTravelers: number;
}

export const getPreferences = (): Preferences => {
  if (typeof window === "undefined") return { currency: "EUR", dateFormat: "DD.MM.YYYY", defaultTravelers: 1 };
  const preferences = localStorage.getItem("travelmind_preferences");
  return preferences ? JSON.parse(preferences) : { currency: "EUR", dateFormat: "DD.MM.YYYY", defaultTravelers: 1 };
};

export const setPreferences = (preferences: Preferences): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("travelmind_preferences", JSON.stringify(preferences));
};

export interface Notifications {
  promotions: boolean;
  reminders: boolean;
  newFeatures: boolean;
}

export const getNotifications = (): Notifications => {
  if (typeof window === "undefined") return { promotions: true, reminders: true, newFeatures: true };
  const notifications = localStorage.getItem("travelmind_notifications");
  return notifications ? JSON.parse(notifications) : { promotions: true, reminders: true, newFeatures: true };
};

export const setNotifications = (notifications: Notifications): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("travelmind_notifications", JSON.stringify(notifications));
};
