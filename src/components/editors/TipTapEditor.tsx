import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Menubar from "../Menubar";

export default function TipTapEditor() {
	const editor = useEditor({
		extensions: [StarterKit],
		content: ``
	})

	return (
		<div>
			{ editor ? <Menubar editor={editor}/> : null }
			<EditorContent editor={editor}/>
		</div>
	)
}
