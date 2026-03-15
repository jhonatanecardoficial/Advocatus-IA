import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class BillingCertificationService {

  // No mundo real, estas chaves viriam de um cofre de segredos.
  // Para fins de desenvolvimento/MOCK, geramos ou usamos uma fixa.
  private readonly mockPrivateKey: string;
  private readonly mockPublicKey: string;

  constructor() {
    // Gerar um par de chaves RSA de teste (1024 bits é o padrão comum para certificação AT antiga, embora 2048 seja melhor)
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
    this.mockPrivateKey = privateKey;
    this.mockPublicKey = publicKey;
  }

  /**
   * Conforme Portaria 144/2019:
   * A mensagem a assinar deve seguir o formato:
   * InvoiceDate;SystemEntryDate;InvoiceReference;GrossAmount;LastHash
   */
  createSignatureMessage(
    invoiceDate: string, // YYYY-MM-DD
    systemEntryDate: string, // YYYY-MM-DDTHH:mm:ss
    reference: string,
    grossAmount: number,
    lastHash?: string,
  ): string {
    const formattedAmount = grossAmount.toFixed(2);
    const lastHashClean = lastHash ? lastHash : '';
    
    // AT exige separação por ponto-e-vírgula
    return `${invoiceDate};${systemEntryDate};${reference};${formattedAmount};${lastHashClean}`;
  }

  sign(message: string): string {
    const signer = crypto.createSign('RSA-SHA1');
    signer.update(message);
    signer.end();
    return signer.sign(this.mockPrivateKey, 'base64');
  }

  getHashControl(signature: string): string {
    // A chave de controlo impressa na fatura são os caracteres nas posições 1, 11, 21 e 31 da assinatura (1-indexed)
    // No JS (0-indexed): 0, 10, 20, 30
    if (signature.length < 31) return 'ERROR';
    return signature[0] + signature[10] + signature[20] + signature[30];
  }

  verify(message: string, signature: string): boolean {
    const verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(message);
    verifier.end();
    return verifier.verify(this.mockPublicKey, signature, 'base64');
  }
}
