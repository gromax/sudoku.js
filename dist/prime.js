let coms = [
    'CagBBBCCB:g:10',
    'CagECDCCCCDCEBDBEBFBGCGBH:g:10',
    'CagBIBJCICJ:g:10',
    'CagCFDFDGDHCHEHDI:g:10',
    'CagDBEBFBFCFDGBGCHBHCIC:g:10',
    'CagIBJBJC:g:10',
    'CagGDGEHDHE:g:10',
    'CagEDDDDE:g:10',
    'CagEEFE:g:10',
    'CagEFEG:g:10',
    'CagFFGF:g:10',
    'CagFGGG:g:10',
    'CagIFHFHGHHGH:g:10',
    'CagJIJJIJ:g:10',
    'CagDJEJEIFHFIFJGIGJHIHJIGIHIIJDJEJFJGJHIDIE:g:10',
  ].join(';');
  
  new GameModule.Game("#board", "#pad", '9x9S', coms);