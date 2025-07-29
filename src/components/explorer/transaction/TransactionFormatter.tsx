import { ExtendedTransactionDetails, FormattedTransactionData, FormattedTransactionSection, TransactionAction } from '@/services/explorer/types';

export class TransactionFormatter {
  static formatTransaction(transaction: ExtendedTransactionDetails): FormattedTransactionData {
    const sections: FormattedTransactionSection[] = [];
    
    // Section principale
    const mainSection: FormattedTransactionSection = {
      title: "Transaction Details",
      fields: [
        {
          label: "Type",
          value: transaction.action.type,
          type: 'text'
        }
      ]
    };
    
    // Traitement selon le type d'action
    switch (transaction.action.type) {
      case 'order':
        this.formatOrderAction(transaction.action, mainSection);
        break;
        
      case 'twapOrder':
        this.formatTwapOrderAction(transaction.action, mainSection);
        break;
        
      case 'cancel':
        this.formatCancelAction(transaction.action, mainSection);
        break;
        
      case 'deposit':
      case 'withdraw':
        this.formatTransferAction(transaction.action, mainSection);
        break;
        
      case 'spotTransfer':
        this.formatSpotTransferAction(transaction.action, mainSection);
        break;
        
      case 'spotDeploy':
        this.formatSpotDeployAction(transaction.action, mainSection);
        break;
        
      case 'accountClassTransfer':
        this.formatAccountClassTransferAction(transaction.action, mainSection);
        break;
        
      case 'cStakingTransfer':
        this.formatStakingAction(transaction.action, mainSection);
        break;
        
      default:
        this.formatGenericAction(transaction.action, mainSection);
        break;
    }
    
    sections.push(mainSection);
    
    return {
      hash: transaction.hash,
      time: transaction.time,
      user: transaction.user,
      block: transaction.block,
      error: transaction.error,
      sections
    };
  }
  
  private static formatOrderAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.orders && action.orders.length > 0) {
      const orders = action.orders;
      orders.forEach((order, index: number) => {
        const orderPrefix = orders.length > 1 ? `Order ${index + 1} - ` : '';
        
        section.fields.push(
          {
            label: `${orderPrefix}Asset`,
            value: order.a,
            type: 'text'
          },
          {
            label: `${orderPrefix}Side`,
            value: order.b ? 'Buy' : 'Sell',
            type: 'text'
          },
          {
            label: `${orderPrefix}Price`,
            value: order.p,
            type: 'amount'
          },
          {
            label: `${orderPrefix}Size`,
            value: order.s,
            type: 'amount'
          },
          {
            label: `${orderPrefix}Reduce Only`,
            value: order.r,
            type: 'boolean'
          }
        );
        
        if (order.t) {
          if (order.t.limit) {
            section.fields.push({
              label: `${orderPrefix}Time in Force`,
              value: order.t.limit.tif,
              type: 'text'
            });
          }
          
          if (order.t.trigger) {
            section.fields.push(
              {
                label: `${orderPrefix}Trigger Price`,
                value: order.t.trigger.triggerPx,
                type: 'amount'
              },
              {
                label: `${orderPrefix}TP/SL`,
                value: order.t.trigger.tpsl,
                type: 'text'
              },
              {
                label: `${orderPrefix}Is Market`,
                value: order.t.trigger.isMarket,
                type: 'boolean'
              }
            );
          }
        }
      });
    }
  }
  
  private static formatTwapOrderAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.twap) {
      const twap = action.twap;
      section.fields.push(
        {
          label: "Asset",
          value: twap.a,
          type: 'text'
        },
        {
          label: "Side",
          value: twap.b ? 'Buy' : 'Sell',
          type: 'text'
        },
        {
          label: "Size",
          value: twap.s,
          type: 'amount'
        },
        {
          label: "Reduce Only",
          value: twap.r,
          type: 'boolean'
        },
        {
          label: "Duration (minutes)",
          value: twap.m,
          type: 'text'
        },
        {
          label: "Random Start",
          value: twap.t,
          type: 'boolean'
        }
      );
    }
  }
  
  private static formatCancelAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.cancels && action.cancels.length > 0) {
      const cancels = action.cancels;
      cancels.forEach((cancel, index: number) => {
        const cancelPrefix = cancels.length > 1 ? `Cancel ${index + 1} - ` : '';
        section.fields.push(
          {
            label: `${cancelPrefix}Asset`,
            value: cancel.a,
            type: 'text'
          },
          {
            label: `${cancelPrefix}Order ID`,
            value: cancel.o,
            type: 'text'
          }
        );
      });
    }
  }
  
  private static formatTransferAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.amount) {
      section.fields.push({
        label: "Amount",
        value: action.amount,
        type: 'amount'
      });
    }
    
    if (action.token) {
      section.fields.push({
        label: "Token",
        value: action.token,
        type: 'text'
      });
    }
    
    if (action.destination) {
      section.fields.push({
        label: "Destination",
        value: action.destination,
        type: 'address'
      });
    }
    
    if (action.wei) {
      section.fields.push({
        label: "Wei Amount",
        value: action.wei,
        type: 'amount'
      });
    }
  }
  
  private static formatSpotTransferAction(action: TransactionAction, section: FormattedTransactionSection) {
    this.formatTransferAction(action, section);
    
    if (action.signatureChainId) {
      section.fields.push({
        label: "Signature Chain ID",
        value: action.signatureChainId,
        type: 'text'
      });
    }
    
    if (action.hyperliquidChain) {
      section.fields.push({
        label: "Hyperliquid Chain",
        value: action.hyperliquidChain,
        type: 'text'
      });
    }
  }
  
  private static formatSpotDeployAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.registerToken2) {
      const register = action.registerToken2;
      
      if (register.spec) {
        section.fields.push(
          {
            label: "Token Name",
            value: register.spec.name,
            type: 'text'
          },
          {
            label: "Size Decimals",
            value: register.spec.szDecimals,
            type: 'text'
          },
          {
            label: "Wei Decimals",
            value: register.spec.weiDecimals,
            type: 'text'
          }
        );
      }
      
      if (register.maxGas) {
        section.fields.push({
          label: "Max Gas",
          value: register.maxGas,
          type: 'text'
        });
      }
    }
    
    if (action.userGenesis) {
      section.fields.push({
        label: "Genesis Token",
        value: action.userGenesis.token,
        type: 'text'
      });
      
      if (action.userGenesis.userAndWei) {
        section.fields.push({
          label: "Airdrop Recipients",
          value: action.userGenesis.userAndWei.length,
          type: 'text'
        });
      }
    }
    
    if (action.genesis) {
      section.fields.push(
        {
          label: "Genesis Token",
          value: action.genesis.token,
          type: 'text'
        },
        {
          label: "Max Supply",
          value: action.genesis.maxSupply,
          type: 'amount'
        }
      );
      
      if (action.genesis.noHyperliquidity !== undefined) {
        section.fields.push({
          label: "No Hyperliquidity",
          value: action.genesis.noHyperliquidity,
          type: 'boolean'
        });
      }
    }
    
    if (action.registerSpot) {
      section.fields.push({
        label: "Register Spot Tokens",
        value: action.registerSpot.tokens.join(', '),
        type: 'text'
      });
    }
  }
  
  private static formatAccountClassTransferAction(action: TransactionAction, section: FormattedTransactionSection) {
    this.formatTransferAction(action, section);
  }
  
  private static formatStakingAction(action: TransactionAction, section: FormattedTransactionSection) {
    if (action.validator) {
      section.fields.push({
        label: "Validator",
        value: action.validator,
        type: 'address'
      });
    }
    
    this.formatTransferAction(action, section);
  }
  
  private static formatGenericAction(action: TransactionAction, section: FormattedTransactionSection) {
    // Afficher toutes les propriétés de l'action sauf 'type'
    Object.keys(action).forEach(key => {
      if (key !== 'type') {
        const value = action[key];
        
        if (value !== null && value !== undefined) {
          section.fields.push({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
            type: typeof value === 'object' ? 'json' : 'text'
          });
        }
      }
    });
  }
} 