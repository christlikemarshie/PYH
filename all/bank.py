import marshie

def main():
  

    time = input("what tim is it? ")

    final = convert(time)

    if final >= 7.0 and final <= 8.0:
          print("breakfast time")
          
    elif final >= 12.0 and final <= 13.0:
          print("lunch time")
        
    elif final >= 19.0 and final <= 20.0:
          print("dinner time")



if __name__ == "__main__":
        main()