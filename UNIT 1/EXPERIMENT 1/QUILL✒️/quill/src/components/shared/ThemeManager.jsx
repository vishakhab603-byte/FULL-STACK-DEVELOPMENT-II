import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getPeriod } from "../../utils/timeOfDay";

export default function ThemeManager() {
  const themeMode = useSelector((s) => s.ui.themeMode);
  const themeSkin = useSelector((s) => s.ui.themeSkin);

  useEffect(() => {
    function apply() {
      let period;
      if (themeMode === "light") period = "day";
      else if (themeMode === "dark") period = "night";
      else period = getPeriod(new Date());
      document.documentElement.setAttribute("data-period", period);
      document.documentElement.setAttribute("data-theme-mode", themeMode);
    }
    apply();
    if (themeMode !== "auto") return;
    const id = setInterval(apply, 60 * 1000);
    return () => clearInterval(id);
  }, [themeMode]);

  useEffect(() => {
    if (themeSkin && themeSkin !== "classic") {
      document.documentElement.setAttribute("data-skin", themeSkin);
    } else {
      document.documentElement.removeAttribute("data-skin");
    }
  }, [themeSkin]);

  return null;
}
