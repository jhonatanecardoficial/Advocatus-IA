import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(data: {
        tenantId: string;
        userId?: string;
        action: string;
        resourceType: string;
        resourceId: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    tenantId: data.tenantId,
                    userId: data.userId,
                    action: data.action,
                    resourceType: data.resourceType,
                    resourceId: data.resourceId,
                    oldValue: data.oldValue || {},
                    newValue: data.newValue || {},
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        } catch (error) {
            // We don't want audit logging to break the main flow, but we should log the error
            console.error('Failed to create audit log:', error);
            return null;
        }
    }
}
