import { createContext, useContext } from 'react';

/**
 * One glossary popover for the whole site. The App shell owns it; any page
 * can open a term. A page with a diagram can register that diagram
 * (`setDiagram({ topology, onShowNode })`) so the popover can offer
 * "show on diagram" for terms that are nodes on it.
 */
export const GlossaryContext = createContext({
  openTerm: () => {},
  closeTerm: () => {},
  activeKey: null,
  setDiagram: () => {},
});

export const useGlossary = () => useContext(GlossaryContext);
