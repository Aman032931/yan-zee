import React from "react";
import MenuButton from "./MenuButton";
import GenderDropdown from "./GenderDropdown";
import MainNavigation from "./MainNavigation";
import SearchBar from "./SearchBar";
import HeaderIcons from "./HeaderIcons";
import LoginButton from "./LoginButton";
import MobileSidebar from "./MobileSidebar";

const Header = () => {
  const [isGenderOpen, setIsGenderOpen] = React.useState(false);
  const [isKidsOpen, setIsKidsOpen] = React.useState(false);
  const [selectedGender, setSelectedGender] = React.useState("Women");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const genderRef = React.useRef(null);

  // Close gender dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGender = () => setIsGenderOpen(!isGenderOpen);
  const toggleKids = (e) => {
    e.stopPropagation();
    setIsKidsOpen(!isKidsOpen);
  };
  const selectGender = (gender) => {
    setSelectedGender(gender);
    setIsGenderOpen(false);
    setIsKidsOpen(false);
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#e5e5e5] bg-white px-[20px] max-[768px]:px-[12px]">
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-[20px] max-[768px]:h-[60px] max-[768px]:gap-[12px]">
        {/* LEFT SECTION */}
        <div className="flex flex-1 items-center gap-[20px]">
          <MenuButton isOpen={isSidebarOpen} onClick={toggleSidebar} />

          <GenderDropdown
            ref={genderRef}
            isOpen={isGenderOpen}
            isKidsOpen={isKidsOpen}
            selectedGender={selectedGender}
            onToggle={toggleGender}
            onToggleKids={toggleKids}
            onSelectGender={selectGender}
          />

          <MainNavigation />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex shrink-0 items-center gap-[12px]">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
          />

          <HeaderIcons />

          <LoginButton />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </header>
  );
};

export default Header;