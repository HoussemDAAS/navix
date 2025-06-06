// lib/ai/recommendationService.ts
// Deprecated: Pinecone-based recommendation service removed as part of reverting to pre-RAG state.

import { getPineconeIndex } from '@/lib/pinecone';
import OpenAI from 'openai';
import { fetchProjectById } from '@/services/projectService';
import type { Project } from '@/sanity/schemaTypes/ProjectType';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getSimilarProjects = async (projectId: string): Promise<Project[]> => {
  try {
    // Fetch the project
    const project = await fetchProjectById(projectId, [
      'title',
      'description',
      'categories',
      '"clientName": client->name',
      'content[]',
      'slug',
      '_id',
    ]);
    if (!project) return [];

    // Generate embedding for the project
    const embeddingText = `Project: ${project.title}\nDescription: ${project.description}`;
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: embeddingText,
    });
    const embedding = embeddingRes.data[0].embedding;

    // Query Pinecone for similar projects
    const index = getPineconeIndex();
    const queryRes = await index.query({
      vector: embedding,
      topK: 4,
      includeMetadata: true,
      filter: { projectId: { $ne: projectId } },
    });

    // Get the IDs of the top matches (excluding itself)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchIds = (queryRes.matches || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((match: any) => match.score && match.score > 0.7)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((match: any) => match.id)
      .slice(0, 3);

    // Fetch the full project documents from Sanity, including firstImage
    const similarProjects: Project[] = [];
    for (const id of matchIds) {
      const fullProject = await fetchProjectById(id, [
        'title',
        'description',
        'categories',
        '"clientName": client->name',
        'content[]',
        'slug',
        '_id',
        '"firstImage": featuredImage.asset->url',
      ]);
      if (
        fullProject &&
        fullProject.title &&
        fullProject.description &&
        fullProject.slug &&
        (typeof fullProject.slug === 'string' ? fullProject.slug : fullProject.slug.current)
      ) {
        similarProjects.push(fullProject);
      }
    }
    return similarProjects;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
};