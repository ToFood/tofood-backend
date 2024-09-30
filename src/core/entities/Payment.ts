// Representação dos detalhes do pagador
interface Payer {
    email: string;
    first_name: string;
    identification: {
        type: string;
        number: string;
    };
}

// Tipagem da resposta de criação de pagamento
export interface PaymentCreateResponse {
    id: string;                     // Identificador do pagamento
    status: string;                 // Status atual do pagamento (e.g., approved, pending, rejected)
    transaction_amount: number;     // Montante da transação
    description: string;            // Descrição do pagamento
    payment_method_id: string;      // Método de pagamento utilizado
    payer: Payer;                   // Detalhes do pagador
    created_at: string;             // Data e hora de criação
    external_reference: string;     // Referência externa para identificar o pedido
}

// Entidade Payment (opcional, se precisar armazenar dados localmente)
export class Payment {
    constructor(
        public id: string,
        public status: string,
        public transactionAmount: number,
        public description: string,
        public paymentMethodId: string,
        public payer: Payer,
        public createdAt: string,
        public externalReference: string
    ) { }
}