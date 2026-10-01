import React from "react"
import { useNavigate } from "react-router-dom"
import MenuButton from "./MenuButton"
import GenderDropdown from "./GenderDropdown"
import MainNavigation from "./MainNavigation"
import SearchBar from "./SearchBar"
import HeaderIcons from "./HeaderIcons"
import LoginButton from "./LoginButton"
import MobileSidebar from "./MobileSidebar"

const Header = () => {
  const navigate = useNavigate()
  const [isGenderOpen, setIsGenderOpen] = React.useState(false)
  const [isKidsOpen, setIsKidsOpen] = React.useState(false)
  const [selectedGender, setSelectedGender] = React.useState("Women")
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const genderRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleGender = () => setIsGenderOpen(!isGenderOpen)
  const toggleKids = (e) => {
    e.stopPropagation()
    setIsKidsOpen(!isKidsOpen)
  }
  const selectGender = (gender) => {
    setSelectedGender(gender)
    setIsGenderOpen(false)
    setIsKidsOpen(false)
  }
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-1000 border-b border-[#e5e5e5] bg-white px-5 max-[768px]:px-3">
      {/* =====================================================
          MOBILE — icons row + full-width search below (< sm)
      ===================================================== */}
      <div className="flex flex-col gap-3 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <MenuButton isOpen={isSidebarOpen} onClick={toggleSidebar} />

          <div className="flex items-center gap-4">
            <HeaderIcons />
            <LoginButton />
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
        />
      </div>

      {/* =====================================================
          DESKTOP — original single row (sm and up)
      ===================================================== */}
      <div className="mx-auto hidden h-17.5 max-w-360 items-center justify-between gap-5 sm:flex">
        <div className="flex flex-1 items-center gap-5">
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

        <div className="flex shrink-0 items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
          />

          <HeaderIcons />
          <LoginButton />
        </div>
      </div>

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        selectedGender={selectedGender}
        onSelectGender={selectGender}
      />
    </header>
  )
}

export default Header
