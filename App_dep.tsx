// import {
//   BlockNoteSchema,
//   PartialBlock,
//   defaultBlockSpecs,
//   defaultInlineContentSpecs,
//   defaultStyleSpecs,
//   filterSuggestionItems,
//   insertOrUpdateBlock,
// } from "@blocknote/core";
// import {
//   BlockNoteView,
//   SuggestionMenuController,
//   getDefaultReactSlashMenuItems,
//   useCreateBlockNote,
// } from "@blocknote/react";
// import { useContext, useRef, useState } from "react";
// // import "@blocknote/react/style.css";
// import { Alert, insertAlert } from "./blocks/Alert";
// import { Title, insertTitle } from "./blocks/Title";
// import { useHotkeyOverride, useHotkeys } from "./utils/hotkeys";
// import { createLinkContent } from "./utils/blocknote";
// import Prompt, { PromptContext, PromptProvider } from "./components/Prompt";
// import {
//   writeTextFile,
//   BaseDirectory,
//   createDir,
//   exists,
//   readTextFile,
// } from "@tauri-apps/api/fs";

// export const schema = BlockNoteSchema.create({
//   blockSpecs: {
//     // Adds all default blocks.
//     // ...defaultBlockSpecs,
//     // Adds the Alert block.
//     paragraph: defaultBlockSpecs.paragraph,
//     alert: Alert,
//     title: Title,
//   },
//   inlineContentSpecs: {
//     ...defaultInlineContentSpecs,
//   },
//   styleSpecs: {
//     italic: defaultStyleSpecs.italic,
//     strike: defaultStyleSpecs.strike,
//   },
// });

// function App() {
//   const [name, setName] = useState<string | null>("Interface design");

//   const promptUser = useContext(PromptContext);
//   const editor = useCreateBlockNote({
//     schema,
//     initialContent: [
//       {
//         type: "title",
//         content: "Accessible Interface design",
//       },
//       {
//         type: "paragraph",
//         content:
//           "Accessible interface design plays a crucial role in ensuring that digital platforms, applications, and products are usable by individuals with diverse abilities. It involves creating interfaces that are inclusive, user-friendly, and comply with accessibility standards, allowing everyone, regardless of their disabilities, to access and interact with digital content effectively.",
//       },
//       {
//         type: "paragraph",
//         content: [],
//       },
//       {
//         type: "title",
//         content: "Inclusivity",
//       },
//       {
//         type: "paragraph",
//         content: [
//           "Accessible interface design ensures that individuals with disabilities, such as visual, auditory, motor, or ",
//           createLinkContent(
//             "cognitive impairments",
//             "https://www.alzheimer-nederland.nl/dementie/soorten-vormen/mild-cognitive-impairment",
//           ),
//           ", can navigate and interact with digital interfaces independently.",
//         ],
//       },
//       {
//         type: "paragraph",
//         content: [],
//       },
//       {
//         type: "title",
//         content: "Ethical Responsibility",
//       },
//       {
//         type: "paragraph",
//         content:
//           "Ensuring accessibility is not only a legal requirement but also a moral obligation. All individuals deserve equal access to information and services, and accessible interface design helps fulfill this fundamental right.",
//       },
//     ],
//   });

//   editor.onEditorContentChange(() => {
//     console.log(editor.document);
//   });

//   const save = async () => {
//     const documentDir = "documents";
//     const sourceDir = BaseDirectory.AppData;

//     const hasDir = await exists(documentDir, { dir: sourceDir });

//     if (!hasDir) {
//       await createDir(documentDir, {
//         dir: sourceDir,
//         recursive: true,
//       });
//     }

//     await writeTextFile(
//       {
//         path: `${documentDir}/document.json`,
//         contents: JSON.stringify(editor.document),
//       },
//       { dir: sourceDir },
//     );
//   };

//   const load = async () => {
//     const documentDir = "documents";
//     const sourceDir = BaseDirectory.AppData;

//     const contents = await readTextFile(`${documentDir}/document.json`, {
//       dir: sourceDir,
//     });

//     const json = JSON.parse(contents);

//     editor.replaceBlocks(editor.document, json);
//   };

//   const updateToLink = async () => {
//     try {
//       const url = await promptUser("Type a url for this link.");

//       if (url === null) {
//         return;
//       }

//       editor.focus();
//       editor.createLink(url, editor.getSelectedText());
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useHotkeyOverride();

//   useHotkeys("cmd+u", (event) => {
//     event.preventDefault();
//     updateToLink();
//   });

//   useHotkeys("cmd+b", (event) => {
//     event.preventDefault();
//     insertOrUpdateBlock(editor, {
//       type: "title",
//     });
//   });

//   useHotkeys("cmd+o", (event) => {
//     event.preventDefault();
//     updateToLink();
//   });

//   return (
//     <main
//       aria-describedby="name"
//       className="flex h-screen w-screen flex-col gap-y-5 bg-black p-5 text-white [&_a]:underline"
//     >
//       <button className="bg-slate-500 text-left text-white" onClick={save}>
//         Save
//       </button>
//       <button className="bg-slate-500 text-left text-white" onClick={load}>
//         load
//       </button>
//       <input
//         aria-description="Document name"
//         id="name"
//         className="w-full bg-gray-800 text-2xl font-bold text-white ring-1 ring-white"
//         type="text"
//         value={name || ""}
//         onChange={(event) => setName(event?.target.value)}
//       />
//       <BlockNoteView
//         className="max-w-[46em] bg-gray-800 text-white ring-1 ring-white"
//         editor={editor}
//         slashMenu={false}
//         // sideMenu={false}
//         formattingToolbar={false}
//         hyperlinkToolbar={false}
//       >
//         <SuggestionMenuController
//           triggerCharacter="/"
//           getItems={async (query) =>
//             filterSuggestionItems(
//               [
//                 ...getDefaultReactSlashMenuItems(editor),
//                 insertTitle(editor),
//                 insertAlert(editor),
//               ],
//               query,
//             )
//           }
//         />
//       </BlockNoteView>
//     </main>
//   );
// }
// export default App;
