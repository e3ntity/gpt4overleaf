echo "Packacking extension for submission to the Chrome Web Store."

zip -r gpt4overleaf.zip ./* -x .git/**\* -x .gitignore -x deploy.sh -x README.md
