import React, {useState} from "react";
import {useDebounce} from "@/hook";
import {CategoriesTree, CategoryNode} from "@/interface";
import {useMobXStores} from "@/context/mobx-context";
import {Button, Stack, TextField, Typography, Modal} from "@mui/material";
import {EMenuAction} from "@/components/CategoriesTreeView/types";

type TProps = {
    openModal: boolean,
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
    selectedNode: CategoryNode | undefined,
    selectedAction: EMenuAction | undefined,
    setSelectedAction: React.Dispatch<React.SetStateAction<EMenuAction | undefined>>
}

export const ModalWindow: React.FC<TProps> = (
    {
        openModal,
        setOpenModal,
        selectedNode,
        selectedAction,
    }
) => {
    const {tagsAndCategoriesStore: {findCategoryById, createCategory, createAndAttachCategory, renameCategory, deleteCategory}} = useMobXStores();
    const [name, setName] = useState("");
    const [error, setError] = useState(false);

    const debouncedSetError = useDebounce(setError, 500);

    const validateName = () => {
        debouncedSetError(findCategoryById(name));
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = event.target.value;
        setName(name);
        validateName();
    }

    const handleCategoryCreate = () => {
        createCategory(name);
        setOpenModal(false);
        setName("");
    };

    const handleCategoryCreateAndAttach = () => {
        if (selectedNode) {
            createAndAttachCategory(name, selectedNode.id);
            setOpenModal(false);
            setName("");
        }
    };

    const handleCategoryRename = () => {
        if (selectedNode) {
            renameCategory(selectedNode.id, name);
            setOpenModal(false);
            setName("");
        }
    };

    const handleCategoryDelete = () => {
        if (selectedNode) {
            deleteCategory(selectedNode.id);
            setOpenModal(false);
            setName("");
        }
    };

    return (
        <Modal open={openModal} onClose={() => setOpenModal(false)} keepMounted>
            <div className="absolute top-1/2 left-1/2 w-1/3 bg-blue-100 p-1 text-black">
                <div className="justify-center items-center w-1/2">
                    {selectedAction === EMenuAction.Create || selectedAction === EMenuAction.CreateAndAttach || selectedAction === EMenuAction.Rename ? (
                        <>
                            <TextField
                                sx={{color: "#000"}}
                                required
                                label={selectedAction === EMenuAction.Create ? "Name" : "New Name"}
                                value={name}
                                onChange={handleChange}
                                error={error}
                                helperText={error ? "Category with this name already exists" : undefined}
                                type="text"
                                variant="outlined"
                            />
                            <Stack spacing={3} direction="row">
                                <Button variant="text" onClick={() => setOpenModal(false)}>Cancel</Button>
                                {selectedAction === EMenuAction.Create ? (
                                    <Button variant="contained" onClick={() => handleCategoryCreate()}>Create</Button>
                                ) : selectedAction === EMenuAction.CreateAndAttach ? (
                                    <Button variant="contained" onClick={() => handleCategoryCreateAndAttach()}>Create
                                        and Attach</Button>
                                ) : (
                                    <Button variant="contained" onClick={() => handleCategoryRename()}>Rename</Button>
                                )}
                            </Stack>
                        </>
                    ) : selectedAction === EMenuAction.Delete ? (
                        <>
                            <Typography variant="h3">Are you sure you want to delete a category with
                                name: {`«${selectedNode?.name}»`}</Typography>
                            <Stack spacing={3} direction="row">
                                <Button variant="text" onClick={() => setOpenModal(false)}>Cancel</Button>
                                <Button variant="contained" onClick={() => handleCategoryDelete()}>Delete</Button>
                            </Stack>
                        </>
                    ) : null}
                </div>
            </div>
        </Modal>
    )
};
