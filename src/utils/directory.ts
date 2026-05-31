import { getSortedPosts } from "./post";
import { i18n } from "../i18n/translation";
import I18nKey from "../i18n/i18nKey";


export interface DirectoryNode {
    name: string;
    type: 'folder' | 'file';
    url?: string;
    children?: DirectoryNode[];
}

export async function getDirectoryTree(): Promise<DirectoryNode[]> {
    const rootMap = {
        posts: i18n(I18nKey.posts),
    };

    const tree: Record<string, any> = {};

    function addNode(paths: string[], name: string, url: string) {
        let current = tree;
        for (const part of paths) {
            if (!current[part]) {
                current[part] = { name: part, type: 'folder', children: {} };
            }
            current = current[part].children;
        }
        current[name] = { name, type: 'file', url };
    }

    const posts = await getSortedPosts();
    for (const post of posts) {
        if (post.data.draft) continue;
        const parts = post.id.split('/');
        const fileName = parts.pop()!;
        const paths = [rootMap.posts, ...parts];
        addNode(paths, post.data.title || fileName, `/posts/${post.id}/`);
    }

    function toArray(obj: Record<string, any>): DirectoryNode[] {
        const arr = Object.values(obj).map(node => {
            if (node.type === 'folder') {
                return {
                    name: node.name,
                    type: 'folder',
                    children: toArray(node.children)
                } as DirectoryNode;
            }
            return {
                name: node.name,
                type: 'file',
                url: node.url
            } as DirectoryNode;
        });

        // Sort: folders first, then files, both alphabetically
        arr.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return arr;
    }

    return toArray(tree);
}
