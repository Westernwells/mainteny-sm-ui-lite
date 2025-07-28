// Hardcoded for attachments, can be made generic in the future if we have other tree structures
import {AttachmentNode, AttachmentView} from 'models/attachment';
import {fuzzyMatch} from 'utils/search';

export const nodeHasMatches = (
  node: AttachmentNode,
  query: string,
): boolean => {
  if (node.value === 'root') {
    return node.children.some((child) => nodeHasMatches(child, query));
  }

  const file = node.value as AttachmentView;

  if (fuzzyMatch(file.name, query)) {
    return true;
  }

  return node.children.some((child) => nodeHasMatches(child, query));
};

export const filterTreeNodes = (
  nodes: AttachmentNode[],
  query: string,
): AttachmentNode[] => {
  if (!query.trim()) return nodes;

  const shouldIncludeNode = (node: AttachmentNode): boolean => {
    if (node.value === 'root') return true;

    const file = node.value as AttachmentView;
    return fuzzyMatch(file.name, query);
  };

  const filterRecursive = (
    nodesToFilter: AttachmentNode[],
  ): AttachmentNode[] => {
    const result: AttachmentNode[] = [];

    nodesToFilter.forEach((node) => {
      if (node.value === 'root') {
        const filteredChildren = filterRecursive(node.children);
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      } else {
        const file = node.value as AttachmentView;
        const nodeMatches = shouldIncludeNode(node);
        const filteredChildren = filterRecursive(node.children);

        if (file.isFolder) {
          // Include folder if it matches OR has matching children
          if (nodeMatches || filteredChildren.length > 0) {
            result.push({
              ...node,
              children: filteredChildren,
            });
          }
        } else if (nodeMatches) {
          result.push({
            ...node,
            children: [],
          });
        }
      }
    });

    return result;
  };

  return filterRecursive(nodes);
};
