LATEX=xelatex

all: memoire clean

memoire:
	$(LATEX) memoire.tex
	bibtex memoire
	$(LATEX) memoire.tex
	$(LATEX) memoire.tex

clean:
	find ./ -type f -name "*.aux" -exec rm {} +
	find ./ -type f -name "*.log" -exec rm {} +
	find ./ -type f -name "*.blg" -exec rm {} +
	find ./ -type f -name "*.bbl" -exec rm {} +
	find ./ -type f -name "*.out" -exec rm {} +
	find ./ -type f -name "*.lof" -exec rm {} +
	find ./ -type f -name "*.lot" -exec rm {} +
	find ./ -type f -name "*.toc" -exec rm {} +

mrproper: clean
	find ./ -type f -name "memoire.dvi" -exec rm {} +
	find ./ -type f -name "memoire.ps" -exec rm {} +
	find ./ -type f -name "memoire.pdf" -exec rm {} +
