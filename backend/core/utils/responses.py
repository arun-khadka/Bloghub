from rest_framework.response import Response

def success_response(data=None, message="Success", status_code=200):
    return Response({
        "success": True,
        "data": data if data is not None else {},
        "message": message,
        "errors": {}
    }, status=status_code)


def error_response(message="Error", errors=None, status_code=400):
    return Response({
        "success": False,
        "data": {},
        "message": message,
        "errors": errors if errors is not None else {}
    }, status=status_code)
