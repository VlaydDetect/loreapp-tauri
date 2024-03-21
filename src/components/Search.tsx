import { MdSearch } from 'react-icons/md';

const Search = ({ handleSearch }: { handleSearch: Function }) => {
    return (
        <div className="tw-flex tw-items-center tw-bg-cool-white tw-rounded-[10px] tw-p-[5px] tw-mb-[1.5em]">
            <MdSearch className="" size="1.3em" />
            <input
                onChange={e => handleSearch(e.target.value)}
                type="text"
                placeholder="Type to search..."
                className="border-none bg-cool-white focus:outline-none"
            />
        </div>
    );
};

export default Search;
