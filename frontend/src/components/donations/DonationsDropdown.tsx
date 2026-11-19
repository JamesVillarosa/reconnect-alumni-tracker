import { ChevronDown } from "lucide-react";


const DonationsDropdown = ({ choices, label, selected, setSelected, className }: { className?: string, choices: string[], label: string, selected: string | undefined; setSelected: React.Dispatch<React.SetStateAction<string>>, alt?: boolean }) => {
    return (
        <div className="text-primary dropdown card dropdown-start dropdown-bottom rounded-xl">
            <div tabIndex={0} role="button" className={`h-10 font-normal placeholder flex justify-between focus:outline-white input w-full rounded-xl outline-0 text-primary ${className ?? ''}`}>
                {selected || label}
                <ChevronDown className="text-primary" strokeWidth={2} />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box shadow z-[1] rounded-xl mt-2 w-full ">
                {choices.map((choice, index) => (
                    <div key={index} className='flex w-full'>
                        <a
                            onClick={() =>{ setSelected(choice); if (document.activeElement instanceof HTMLElement) document.activeElement.blur();} }
                            className={`grow rounded-lg p-2 text-lg sm:text-base active:bg-transparent focus:bg-transparent hover:bg-MidBlue transition  ${selected === choice ? 'bg-white text-primary' : ''}`}
                        >
                            {choice}
                        </a>
                    </div>
                ))}
            </ul>
        </div>)
}

export default DonationsDropdown;