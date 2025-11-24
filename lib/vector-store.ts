import { env } from "./config";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { TaskType } from "@google/generative-ai";

export async function embedAndStoreDocs(
  client: PineconeClient,
  // @ts-ignore docs type error
  docs: Document<Record<string, any>>[]
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: env.GEMINI_API_KEY,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });
    // console.log("embee", embeddings)
    const index = client.Index(env.PINECONE_INDEX_NAME);
// console.log("Passed: ", index)
//embed the PDF documents
await PineconeStore.fromDocuments(docs, embeddings, {
  pineconeIndex: index,
  textKey: "text",
});
console.log("Passed2 ")
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
}

// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStore(client: PineconeClient) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: env.GEMINI_API_KEY,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });
    const index = client.Index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}
