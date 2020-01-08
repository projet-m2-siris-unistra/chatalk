\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{memoire}[2020/01/07 Mémoire class]

\LoadClass[11pt, oneside, titlepage, a4paper]{report}

\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage[french]{babel}
\selectlanguage{french}
\RequirePackage[numbib]{tocbibind}
\RequirePackage{titlesec}
\RequirePackage{graphicx}
\RequirePackage{tabularx}
\RequirePackage{graphics}
\RequirePackage[inner=20mm,outer=20mm,top=15mm,bottom=15mm]{geometry}
\RequirePackage[bottom]{footmisc}
\RequirePackage{perpage}
\RequirePackage{enumitem}
\RequirePackage{multicol}
\RequirePackage{cite}
\RequirePackage{listings}
\RequirePackage{url}
\RequirePackage{amssymb}
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
