import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '#start/env'

class R2Service {
    private client: S3Client
    private maxFileSize: number = 5 * 1024 * 1024 // 5MB
    private allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']

    constructor() {
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: env.get('R2_ACCESS_KEY_ID'),
                secretAccessKey: env.get('R2_SECRET_ACCESS_KEY'),
            },
        })
    }

    private validateFileType(mimeType: string): boolean {
        return this.allowedMimeTypes.includes(mimeType)
    }

    private validateFileSize(size: number): boolean {
        return size <= this.maxFileSize
    }

    async getUploadUrl(key: string, contentType: string, size: number): Promise<string> {
        if (!this.validateFileType(contentType)) {
            throw new Error('Type de fichier invalide')
        }

        if (!this.validateFileSize(size)) {
            throw new Error('La taille du fichier dépasse la limite')
        }

        const command = new PutObjectCommand({
            Bucket: env.get('R2_BUCKET_NAME'),
            Key: key,
            ContentType: contentType,
        })

        return getSignedUrl(this.client, command, { expiresIn: 3600 })
    }

    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: env.get('R2_BUCKET_NAME'),
            Key: key,
        })

        await this.client.send(command)
    }

    getPublicUrl(key: string): string {
        return `${env.get('R2_CUSTOM_DOMAIN')}/${key}`
    }
}

export default new R2Service()