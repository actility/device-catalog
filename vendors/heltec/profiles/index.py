import os

# Directory containing the YAML files
directory = './'  # Change to your directory path if needed

# Iterate over all files in the directory
for filename in os.listdir(directory):
    if filename.startswith("HELT") and filename.endswith(".yaml"):
        file_path = os.path.join(directory, filename)
        
        # Read the original content of the file
        with open(file_path, 'r') as file:
            content = file.read()

        # Write the new content with the "deprecated" line at the top
        with open(file_path, 'w') as file:
            file.write("# Deprecated profiles will not be added to the next device profiles catalog. Profiles cannot just be deleted from the repository.\n" + content)