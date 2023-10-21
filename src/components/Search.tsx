import { MdSearch } from "react-icons/md";

const Search = ({ handleSearch }: { handleSearch: Function }) => {
	return (
		<div className="flex items-center bg-cool-white rounded-[10px] p-[5px] mb-[1.5em]">
			<MdSearch className="" size="1.3em"/>
			<input onChange={(e) => handleSearch(e.target.value)} type="text" placeholder="Type to search..." className="border-none bg-cool-white focus:outline-none"/>
		</div>
	)
}

export default Search
