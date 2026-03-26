import sys
import torch

print("=" * 50)
print("ENVIRONMENT VERIFICATION")
print("-" * 50)

# Python version
assert sys.version_info >= (3, 10), f"Need Python 3.10+, got {sys.version}"
print(f"Python {sys.version_info.major}.{sys.version_info.minor}")

# PyTorch
print(f"PyTorch {torch.__version__}")
print(f"GPU available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"  GPU: {torch.cuda.get_device_name(0)}")
    print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# Transformers
import transformers
print(f"  Transformers {transformers.__version__}")

# PEFT (LoRA)
import peft
print(f"  PEFT {peft.__version__}")

# FastAPI
import fastapi
print(f"  FastAPI {fastapi.__version__}")

# Redis
import redis
print(f"  Redis client {redis.__version__}")

print()
print("✅ ALL CHECKS PASSED - Ready for Phase 2")
