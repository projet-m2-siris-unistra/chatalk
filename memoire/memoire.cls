\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{memoire}[2020/01/07 Mémoire class]

\LoadClass[11pt, twoside, openright, titlepage, a4paper]{article}
%\LoadClass[10pt, oneside, titlepage, a4paper]{article}

\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage[french,english]{babel}
\RequirePackage[numbib]{tocbibind}
\selectlanguage{english}
\RequirePackage{graphicx}
\RequirePackage{tabularx}
\RequirePackage{graphics}
\RequirePackage[inner=25mm,outer=25mm,top=20mm,bottom=20mm]{geometry}
\RequirePackage[bottom]{footmisc}
\RequirePackage{perpage}
\RequirePackage{multicol}
\RequirePackage{cite}
\RequirePackage{listings}
\RequirePackage{url}
\RequirePackage{hyperref}
\RequirePackage{caption}
\RequirePackage{svg}
\RequirePackage{setspace}
\MakePerPage{footnote} %the perpage package command

%\setkeys {Gin} {keepaspectratio}	% par défaut : conserver les proportions

\parskip=1mm
\parindent=4mm
\pagestyle{plain}

\newcommand{\bslash}{\texttt{\symbol{92}}}

%     % Fonte élégante
%     \usepackage {mathpazo}
%     \usepackage [scaled] {helvet}
%     \usepackage {courier}
%
%     % pour \EUR
%     \usepackage {marvosym}
%
%     % \usepackage {emptypage}
%
%
