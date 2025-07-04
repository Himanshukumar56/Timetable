import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { motivationalQuotes } from "../../utils/constants"; // Import constants

const Footer = () => {
  const { themeClasses } = useTheme();
  const [dailyQuote, setDailyQuote] = React.useState({ quote: "", author: "" });

  React.useEffect(() => {
    // Select a random quote once on component mount
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setDailyQuote(motivationalQuotes[randomIndex]);
  }, []);

  return (
    <footer
      className={`p-4 ${themeClasses.secondaryBg} ${themeClasses.shadow} text-center`}
    >
      <p className={`text-sm italic ${themeClasses.secondaryText}`}>
        "{dailyQuote.quote}" - {dailyQuote.author}
      </p>
    </footer>
  );
};

export default Footer;
