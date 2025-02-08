let coms = [
    'CagBBCB:r:10-{2}',
    'CagCCDC:r:10-{0}',
    'CagBDCDDD:r:10-{4}',
    'CagFB:r:10-{6}',
    'CagEDFD:r:10-{8}',
    'CagGC:r:10-{1}',
    'CagGDGE:r:10-{9}',
    'CagHCHDICIDJCJD:r:10-{5}',
    'CagEHEIEJFJGJGIGH:r:10-{3}',
    'CagIH:r:10-{7}',
    'CagDB:b:10-{9}',
    'CagBFCFDFEFFF:b:10-{1}',
    'CagGFHFIFJF:b:10-{2}',
    'CagGG:b:10-{3}',
    'CagFH:b:10-{8}',
    'CagBIBJCICJ:b:10-{1}',
    'CagEB:p:10-{3}',
    'CagGB:p:10-{0}',
    'CagBECEDEEEFE:p:10-{7}',
    'CagHEIEJE:p:10-{2}',
    'CagBG:p:10-{1}',
    'CagDGEGFG:p:10-{3}',
    'CagHG:p:10-{4}',
    'CagIGJG:p:10-{0}',
    'CagHBIBJB:g:10-{9}',
    'CagBHCHDH:g:10-{3}',
    'CagDIDJ:g:10-{2}',
    'CagHHHIIIJIJH:g:10-{9}',
    'CagBC:y:10-{1}',
    'CagECFC:y:10-{9}',
    'CagCG:y:10-{1}',
    'CagFI:y:10-{1}',
    'CagHJIJ:y:10-{2}',
    'CagJJ:y:10-{0}',
    'DiBd:kw30',
    'DiCi:kw30',
    'DihC:kw30',
    'DicC:kw30',
  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}