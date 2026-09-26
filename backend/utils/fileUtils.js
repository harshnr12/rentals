import fs from 'node:fs/promises';
import path from 'node:path';

const imagesDir = path.join(
    import.meta.dirname,
    '..',
    'public',
    'images'
);

const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File does not exist: ${filePath}`);
        } else {
            throw error;
        }
    }
};

const deletePhotoFiles = async (photos) => {
    for (const photo of photos) {

        if (!photo.startsWith('/images/')) {
            continue;
        }

        const filename = path.basename(photo);
        const filePath = path.join(imagesDir, filename);

        await deleteFile(filePath);
    }
};
export default deletePhotoFiles;