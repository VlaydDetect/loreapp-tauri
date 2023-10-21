import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

interface IProps {
    onBackArrowClick: () => void;
    canGoBackward: boolean;
    onForwardArrowClick: () => void;
    canGoForward: boolean;
}

const FolderNavigation = ({ onBackArrowClick, canGoBackward, onForwardArrowClick, canGoForward }: IProps) => (
    <div className="mb-5 w-full">
        <div className="space-x-4">
            <button onClick={onBackArrowClick} disabled={!canGoBackward} className={canGoBackward ? undefined : "text-gray-600"}>
                <AiOutlineArrowLeft/>
            </button>

            <button onClick={onForwardArrowClick} disabled={!canGoForward} className={canGoForward ? undefined : "text-gray-600"}>
                <AiOutlineArrowRight/>
            </button>
        </div>
    </div>
)

export default FolderNavigation
