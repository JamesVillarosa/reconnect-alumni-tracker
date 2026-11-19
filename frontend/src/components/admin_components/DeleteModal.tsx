interface DeleteModalProps {
    modalID: string;
    modalHeader: string;
    itemType: string;
    itemName: string,
    id: string,
    deleteFunction: (id: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    modalID,
    modalHeader,
    itemType,
    itemName,
    id,
    deleteFunction
}) => {
    return (
        <dialog id={modalID} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center justify-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <div className="flex flex-col items-center">
                        <h3 className="">{modalHeader}</h3>
                    </div>
                    <button className="absolute right-0 ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>

                <div className="flex flex-col text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">                   
                    <p className="text-center font-medium">Are you sure you want to delete the {itemType}</p>
                    <p className="text-center font-medium"><span className="font-bold">{itemName}</span>?</p>
                </div>

                <div className="flex flex-row justify-end items-center gap-2">
                    <form method="dialog" className="flex gap-2">
                        <button 
                            className={`btn text-Primary hover:bg-Primary hover:text-white border-2 border-Primary rounded-2xl px-5`} 
                            onClick={()=>{}}
                        >
                            CANCEL
                        </button>
                        <button 
                            className={`btn bg-Primary text-white hover:brightness-120 border-2 border-Primary rounded-2xl px-5`} 
                            onClick={() => deleteFunction(id)}
                        >
                            DELETE
                    </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default DeleteModal;